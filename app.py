from flask import Flask, render_template
from back_end.routers.bids_router import bids_router
from back_end.routers.listings_router import listings_router
from back_end.routers.user_router import users_router
from user import user_from_record
from back_end.DAL import users_dal
from flask_login import LoginManager


app = Flask(__name__)
app.secret_key="secret"

login_manager = LoginManager()
login_manager.init_app(app)

def load_user(user_id:str):
    rec = users_dal.find_user_by_id()
    return user_from_record(rec)

app.register_blueprint(bids_router)
app.register_blueprint(listings_router)
app.register_blueprint(users_router)

@app.get('/')
def home():
    return render_template('main_page.html')

@app.get('/edit_post/<int:post_id>')
def edit_post(post_id):
    return render_template('edit_post.html', post_id=post_id)

@app.get('/create_post')
def create_post():
    return render_template('create_post.html')

@app.get('/post/<int:post_id>')
def view_post(post_id):
    return render_template('post.html', post_id=post_id)

@app.get('/user_profile/<int:userid>')
def user_profile(userid):
    return render_template('profile.html', userid=userid)

@app.get('/login')
def login():
    return render_template('log_in.html')

@app.get('/register')
def register():
    return render_template('register.html')

if __name__ == '__main__':
    app.run(debug=True)