from flask import Blueprint, request, jsonify
from uuid import uuid4

from back_end.DAL import bids_dal
bids_router = Blueprint('bids_router', __name__, url_prefix='/bids/api')

@bids_router.post('')
def create_bid():
    bid_data = request.json
    bid_data['_id'] = str(uuid4())
    inserted_id = bids_dal.insert_one_bid(bid_data)
    if inserted_id:
        return jsonify({"inserted_id": inserted_id}), 201
    return jsonify({"error": "Failed to create bid"}), 500

@bids_router.get('/<bid_id>')
def get_bid(bid_id):
    bid = bids_dal.find_one_bid({"_id": bid_id})
    if bid:
        return jsonify(bid), 200
    return jsonify({"error": "Bid not found"}), 404

@bids_router.put('/<bid_id>')
def update_bid(bid_id):
    update_data = request.json
    success = bids_dal.update_one_bid({"_id": bid_id}, update_data)
    if success:
        return jsonify({"message": "Bid updated successfully"}), 200
    return jsonify({"error": "Failed to update bid"}), 500

@bids_router.delete('/<bid_id>')
def delete_bid(bid_id):
    success = bids_dal.delete_one_bid({"_id": bid_id})
    if success:
        return jsonify({"message": "Bid deleted successfully"}), 200
    return jsonify({"error": "Failed to delete bid"}), 500


