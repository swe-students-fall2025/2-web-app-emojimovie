import os
from flask import Flask, render_template, request, redirect
from dotenv import load_dotenv
from back_end.routers.bids_router import bids_router
from back_end.routers.listings_router import listings_router
from back_end.routers.user_router import users_router
from back_end.user import user_from_record
from back_end.DAL import users_dal
from flask_login import LoginManager, current_user, login_user

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "secret")

login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id: str):
    rec = users_dal.find_user_by_id(user_id)
    return user_from_record(rec)


PUBLIC_ENDPOINTS = {
    "login",
    "register",
    "static",
    "users_router.login",
    "users_router.register",
}


@app.before_request
def require_login_globally():
    if request.endpoint in PUBLIC_ENDPOINTS:
        return
    if not current_user.is_authenticated:
        return login_manager.unauthorized()


app.register_blueprint(bids_router)
app.register_blueprint(listings_router)
app.register_blueprint(users_router)


@app.get("/home/<userid>")
def home(userid):
    return render_template("main_page.html", userid=userid)


@app.get("/edit_post/<int:post_id>")
def edit_post(post_id):
    return render_template("edit_post.html", post_id=post_id)


@app.get("/create_post")
def create_post():
    return render_template("create_post.html")


@app.get("/post/<int:post_id>")
def view_post(post_id):
    return render_template("post.html", post_id=post_id)


@app.get("/user_profile/<userid>")
def user_profile(userid):
    return render_template("profile.html", userid=userid)


@app.get("/user_profile/<userid>/edit")
def profile_edit(userid):
    return render_template("profile_edit.html", userid=userid)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user_record = users_dal.find_one_user({"email": username})

        if user_record and user_record["password"] == password:
            user_obj = user_from_record(user_record)
            login_user(user_obj, remember=True)
            return redirect(f'/home/{str(user_record["_id"])}')
        else:
            return render_template("log_in.html", error="Invalid username or password")
    return render_template("log_in.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")

        if not username or not email or not password:
            return render_template("register.html", error="Please fill in all fields")

        if users_dal.find_one_user({"email": email}):
            return render_template("register.html", error="Email already registered")
        user_data = {
            "email": email,
            "password": password,
            "name": username,
            "preferredLocation": "",
            "socialMediaType": "",
            "socialMediaUsername": "",
        }

        inserted_id = users_dal.insert_one_user(user_data)

        if inserted_id:
            user_record = users_dal.find_user_by_id(inserted_id)
            user_obj = user_from_record(user_record)
            login_user(user_obj, remember=True)
            return redirect(f"/home/{inserted_id}")
        else:
            return render_template(
                "register.html", error="Registration failed. Please try again."
            )
    return render_template("register.html")


if __name__ == "__main__":
    app.run(debug=True)
