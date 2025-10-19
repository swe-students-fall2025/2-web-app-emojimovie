from flask import Blueprint, request, jsonify, current_app, url_for
from uuid import uuid4
import os
import base64
import re
from werkzeug.utils import secure_filename


from back_end.DAL import listings_dal

listings_router = Blueprint('listings_router', __name__, url_prefix='/listings/api')

@listings_router.post('')
def create_listing():
    data = request.get_json(force=True)
    itemName = (data.get('itemName') or "").strip()
    description = (data.get('description') or "").strip()
    price = (data.get('price') or "").strip()
    image_url = ""
    photo_obj = None
    photo_data = data.get("photo")

    if photo_data and isinstance(photo_data, dict) and photo_data.get("data_url"):
        m = re.match(r"data:(image/[\w+.-]+);base64,(.+)", photo_data["data_url"])
        if m:
            mime_type, b64data = m.groups()
            ext = mime_type.split("/")[-1]
            filename = secure_filename(f"{uuid4().hex}.{ext}")
            upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, filename)
            with open(path, "wb") as f:
                f.write(base64.b64decode(b64data))
            image_url = url_for('static', filename=f'uploads/{filename}', _external=False)
            photo_obj = {"name": filename, "url": image_url}

    doc = {
        "_id": str(uuid4()),
        "itemName": itemName,
        "description": description,
        "price": price,
        "photo": photo_obj or {"name": "", "url": ""}
    }

    listing = listings_dal.insert_one_listing(doc)
    if not listing:
        return jsonify({"ok": False, "error": "Failed to create listing"}), 500
    return jsonify({"ok": True, "message": "Listing created successfully!", "data": doc}), 201

@listings_router.get('/<listing_id>')
def get_listing(listing_id):
    listing = listings_dal.find_one_listing({"_id": listing_id})
    if listing:
        return jsonify(listing), 200
    return jsonify({"error": "Listing not found"}), 404

@listings_router.put('/<listing_id>')
def update_listing(listing_id):
    data = request.get_json(force=True)

    set_fields = {}
    if 'itemName' in data:        set_fields['itemName'] = (data.get('itemName') or '').strip() 
    if 'description' in data:  set_fields['description'] = (data.get('description') or '').strip()
    if 'price' in data:        set_fields['price'] = (data.get('price') or '').strip()

    new_photo_obj = None
    photo_data = data.get('photo')
    if isinstance(photo_data, dict) and photo_data.get('data_url'):
        m = re.match(r"data:(image/[\w+.-]+);base64,(.+)", photo_data['data_url'])
        if m:
            mime_type, b64data = m.groups()
            ext = (mime_type.split('/')[-1] or 'jpg').lower()
            filename = secure_filename(f"{uuid4().hex}.{ext}")
            upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
            os.makedirs(upload_dir, exist_ok=True)
            path = os.path.join(upload_dir, filename)
            with open(path, 'wb') as f:
                f.write(base64.b64decode(b64data))
            image_url = url_for('static', filename=f'uploads/{filename}', _external=False)
            new_photo_obj = {"name": filename, "url": image_url}
            set_fields['photo'] = new_photo_obj

    prev = listings_dal.find_one_listing({"_id": listing_id})
    if not prev:
        return jsonify({"ok": False, "error": "Listing not found"}), 404

    if new_photo_obj and prev.get('photo', {}).get('url'):
        old_url = prev['photo']['url']
        if old_url.startswith('/static/uploads/'):
            old_name = old_url.rsplit('/', 1)[-1]
            old_path = os.path.join(current_app.root_path, 'static', 'uploads', old_name)
            try:
                if os.path.isfile(old_path):
                    os.remove(old_path)
            except Exception:
                pass

    if not set_fields:
        return jsonify({"ok": True, "message": "Nothing to update", "data": prev}), 200

    updated = listings_dal.update_one_listing({"_id": listing_id}, {"$set": set_fields})
    if not updated:
        return jsonify({"ok": False, "error": "Failed to update listing"}), 500

    merged = {**prev, **set_fields}
    return jsonify({"ok": True, "message": "Listing updated successfully!", "data": merged}), 200

@listings_router.delete('/<listing_id>')
def delete_listing(listing_id):
    success = listings_dal.delete_one_listing({"_id": listing_id})
    if success:
        return jsonify({"message": "Listing deleted successfully"}), 200
    return jsonify({"error": "Failed to delete listing"}), 500

@listings_router.get('/<user_id>/all')
def get_listings_by_user(user_id):
    listings = listings_dal.find_many_listings({"user_id": user_id})
    return jsonify(listings), 200

@listings_router.get('/all')
def get_all_listings():
    listings = listings_dal.find_many_listings({})
    return jsonify(listings), 200

