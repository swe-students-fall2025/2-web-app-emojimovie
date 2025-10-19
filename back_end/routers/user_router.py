from flask import Blueprint, request, jsonify, session
from uuid import uuid4
from flask_login import login_user, logout_user, login_required
from user import user_from_record
from back_end.DAL import users_dal

users_router = Blueprint('users_router', __name__, url_prefix='/users/api')

@users_router.post('/login')
def login():
    data = request.json
    user = users_dal.find_user_by_email(data.get('email'))
    if user and user['password'] == data.get('password'):
        session['user_id'] = user['_id']
        return jsonify({"message": "Logged in"}), 200
    login_user(user_from_record(rec),remember = True)
    return jsonify({"error": "Invalid credentials"}), 401

def logout():
    logout_user()
    return jsonify({"message": "Logged out"}),200
@users_router.get('/profile/<user_id>')
def profile(user_id):
    user = users_dal.find_user_by_id(user_id)
    if user:
        return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404

@users_router.post('/register')
def register():
    data = request.json
    if users_dal.find_user_by_email(data.get('email')):
        return jsonify({"error": "Email already registered"}), 400
    user_data = {
        "email": data.get("email"),
        "password": data.get("password"),
        "name": data.get("name")
    }
    inserted_id = users_dal.insert_one_user(user_data)
    if inserted_id:
        return jsonify({"inserted_id": inserted_id}), 201
    return jsonify({"error": "Registration failed"}), 500

@users_router.post('/profile/<user_id>/edit')
def edit_profile(user_id):
    update_data = request.form.to_dict()
    success = users_dal.update_one_user({"_id": user_id}, update_data)
    if success:
        return jsonify({"message": "Profile updated successfully"}), 200
    return jsonify({"error": "Failed to update profile"}), 500