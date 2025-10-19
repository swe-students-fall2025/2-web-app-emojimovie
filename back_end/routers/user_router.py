from flask import Blueprint, request, jsonify, session
from DAL import users_dal

users_router = Blueprint('users_router', __name__, url_prefix='/users/api')

@users_router.post('/login')
def login():
    data = request.json
    user = users_dal.find_user_by_email(data.get('email'))
    if user and user['password'] == data.get('password'):  
        session['user_id'] = user['_id']
        return jsonify({"message": "Logged in"}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@users_router.get('/profile/<user_id>')
def profile(user_id):
    user = users_dal.find_user_by_id(user_id)
    if user:
        return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404

@users_router.post('/register')
def register():
    data = request.json
    # Check if user already exists
    if users_dal.find_user_by_email(data.get('email')):
        return jsonify({"error": "Email already registered"}), 400
    # Create new user
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
    update_data = request.form 
    success = users_dal.update_user_profile(user_id, update_data)
    if success:
        return jsonify({"message": "Profile updated successfully"}), 200
    return jsonify({"error": "Failed to update profile"}), 500