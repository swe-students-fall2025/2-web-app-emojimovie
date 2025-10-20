from flask import Blueprint, request, jsonify, session
from bson import ObjectId
from flask_login import login_user, logout_user, login_required
from back_end.user import user_from_record
from back_end.DAL import users_dal

users_router = Blueprint("users_router", __name__, url_prefix="/users/api")


@users_router.post("/login")
def login():
    data = request.json
    user_record = users_dal.find_one_user({"email": data.get("email")})
    if user_record and user_record["password"] == data.get("password"):
        user_obj = user_from_record(user_record) 
        login_user(user_obj, remember=True)
        return jsonify({"message": "Logged in"}), 200
    return jsonify({"error": "Invalid credentials"}), 401


@users_router.post("/logout")
def logout():
    logout_user()
    return jsonify({"message": "Logged out"}), 200


@users_router.get("/profile/<user_id>")
def profile(user_id):
    try:
        user = users_dal.find_one_user({"_id": ObjectId(user_id)})

        if user:
            user["_id"] = str(user["_id"])
            return jsonify(user), 200

        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "Invalid user ID"}), 400


@users_router.post("/register")
def register():
    data = request.json

    if users_dal.find_one_user({"email": data.get("email")}):
        return jsonify({"error": "Email already registered"}), 400

    user_data = {
        "email": data.get("email"),
        "password": data.get("password"),
        "name": data.get("name"),
        "preferredLocation": data.get("preferredLocation", ""),
        "socialMediaType": data.get("socialMediaType", ""),
        "socialMediaUsername": data.get("socialMediaUsername", ""),
    }

    inserted_id = users_dal.insert_one_user(user_data)

    if inserted_id:
        return jsonify({"inserted_id": inserted_id}), 201

    return jsonify({"error": "Registration failed"}), 500


@users_router.post("/profile/<user_id>/edit")
def edit_profile(user_id):
    try:
        form_data = request.form.to_dict()

        allowed_fields = [
            "name",
            "email",
            "preferredLocation",
            "socialMediaType",
            "socialMediaUsername",
        ]
        update_data = {k: v for k, v in form_data.items() if k in allowed_fields and v}

        if not update_data:
            return jsonify({"error": "No valid fields to update"}), 400

        success = users_dal.update_one_user({"_id": ObjectId(user_id)}, update_data)

        if success:
            return jsonify({"message": "Profile updated successfully"}), 200

        return jsonify({"error": "Failed to update profile or no changes made"}), 400

    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"error": "Failed to update profile"}), 500
