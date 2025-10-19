from flask import Blueprint, request, jsonify
from uuid import uuid4

from back_end.DAL import listings_dal

listings_router = Blueprint('listings_router', __name__, url_prefix='/listings/api')

@listings_router.post('')
def create_listing():
    listing_data = request.json
    listing_data['_id'] = str(uuid4())
    inserted_id = listings_dal.insert_one_listing(listing_data)
    if inserted_id:
        return jsonify({"inserted_id": inserted_id}), 201
    return jsonify({"error": "Failed to create listing"}), 500

@listings_router.get('/<listing_id>')
def get_listing(listing_id):
    listing = listings_dal.find_one_listing({"_id": listing_id})
    if listing:
        return jsonify(listing), 200
    return jsonify({"error": "Listing not found"}), 404

@listings_router.put('/<listing_id>')
def update_listing(listing_id):
    update_data = request.json
    success = listings_dal.update_one_listing({"_id": listing_id}, update_data)
    if success:
        return jsonify({"message": "Listing updated successfully"}), 200
    return jsonify({"error": "Failed to update listing"}), 500

@listings_router.delete('/<listing_id>')
def delete_listing(listing_id):
    success = listings_dal.delete_one_listing({"_id": listing_id})
    if success:
        return jsonify({"message": "Listing deleted successfully"}), 200
    return jsonify({"error": "Failed to delete listing"}), 500

