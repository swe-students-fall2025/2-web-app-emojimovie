import os
import sys
from typing import Any, Dict, List, Optional, Union

from bson import ObjectId
from pymongo import MongoClient
from pymongo.server_api import ServerApi

from pymongo.errors import PyMongoError
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))


#database connection 
MONGODB_CONNECTION = os.getenv("DATABASE_CONNECTION")
DB_NAME = os.getenv("DB_NAME")
client = MongoClient(MONGODB_CONNECTION,server_api=ServerApi('1'))
client.admin.command('ping')

db = client.get_database(DB_NAME)

#CRUD operations
#find one and many, create one and many, update one and many, delete one and many

#Users
class users_dal:
    def insert_one_user(user_data: Dict[str, Any]) -> str:
        try:
            result = db.users.insert_one(user_data)
            return str(result.inserted_id)
        except PyMongoError as e:
            print(f"Error inserting user: {e}")
            return ""

    def insert_many_users(users_data: List[Dict[str, Any]]) -> List[str]:
        try:
            result = db.users.insert_many(users_data)
            return [str(_id) for _id in result.inserted_ids]
        except PyMongoError as e:
            print(f"Error inserting users: {e}")
            return []

    def find_one_user(filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            user = db.users.find_one(filter)
            return user
        except PyMongoError as e:
            print(f"Error finding user: {e}")
            return None

    def find_many_users(filter: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            users = list(db.users.find(filter))
            return users
        except PyMongoError as e:
            print(f"Error finding users: {e}")
            return []
        
    def update_one_user(filter: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        try:
            result = db.users.update_one(filter, {"$set": update_data})
            return result.modified_count > 0
        except PyMongoError as e:
            print(f"Error updating user: {e}")
            return False

    def update_many_users(filter: Dict[str, Any], update_data: Dict[str, Any]) -> int:
        try:
            result = db.users.update_many(filter, {"$set": update_data})
            return result.modified_count
        except PyMongoError as e:
            print(f"Error updating users: {e}")
            return 0
        
    def delete_one_user(filter: Dict[str, Any]) -> bool:
        try:
            result = db.users.delete_one(filter)
            return result.deleted_count > 0
        except PyMongoError as e:
            print(f"Error deleting user: {e}")
            return False

    def delete_many_users(filter: Dict[str, Any]) -> int:
        try:
            result = db.users.delete_many(filter)  
            return result.deleted_count
        except PyMongoError as e:
            print(f"Error deleting users: {e}")
            return 0
    
    @staticmethod
    def find_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        try:
            from bson import ObjectId
            return users_dal.find_one_user({"_id": ObjectId(user_id)})
        except Exception as e:
            print(f"Error finding user by id: {e}")
            return None

    @staticmethod
    def find_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        try:
            return users_dal.find_one_user({"email": email})
        except Exception as e:
            print(f"Error finding user by email: {e}")
            return None




#Listings
class listings_dal:
    def insert_one_listing(listing_data: Dict[str, Any]) -> str:
        try:
            result = db.listings.insert_one(listing_data)
            return str(result.inserted_id)
        except PyMongoError as e:
            print(f"Error inserting listing: {e}")
            return ""

    def insert_many_listings(listings_data: List[Dict[str, Any]]) -> List[str]:
        try:
            result = db.listings.insert_many(listings_data)
            return [str(_id) for _id in result.inserted_ids]
        except PyMongoError as e:
            print(f"Error inserting listings: {e}")
            return []

    def find_one_listing(filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            listing = db.listings.find_one(filter)
            return listing
        except PyMongoError as e:
            print(f"Error finding listing: {e}")
            return None

    def find_many_listings(filter: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            listings = list(db.listings.find(filter))
            return listings
        except PyMongoError as e:
            print(f"Error finding listings: {e}")
            return []

    def update_one_listing(filter: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        try:
            result = db.listings.update_one(filter, {"$set": update_data})
            return result.modified_count > 0
        except PyMongoError as e:
            print(f"Error updating listing: {e}")
            return False
        
    def update_many_listings(filter: Dict[str, Any], update_data: Dict[str, Any]) -> int:
        try:
            result = db.listings.update_many(filter, {"$set": update_data})
            return result.modified_count
        except PyMongoError as e:
            print(f"Error updating listings: {e}")
            return 0

    def delete_one_listing(filter: Dict[str, Any]) -> bool:
        try:
            result = db.listings.delete_one(filter)
            return result.deleted_count > 0
        except PyMongoError as e:
            print(f"Error deleting listing: {e}")
            return False

    def delete_many_listings(filter: Dict[str, Any]) -> int:
        try:
            result = db.listings.delete_many(filter)  
            return result.deleted_count
        except PyMongoError as e:
            print(f"Error deleting listings: {e}")
            return 0


#Bids
class bids_dal:
    def insert_one_bid(bid_data: Dict[str, Any]) -> str:
        try:
            result = db.bids.insert_one(bid_data)
            return str(result.inserted_id)
        except PyMongoError as e:
            print(f"Error inserting bid: {e}")
            return ""

    def insert_many_bids(bids_data: List[Dict[str, Any]]) -> List[str]:
        try:
            result = db.bids.insert_many(bids_data)
            return [str(_id) for _id in result.inserted_ids]
        except PyMongoError as e:
            print(f"Error inserting bids: {e}")
            return []

    def find_one_bid(filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            bid = db.bids.find_one(filter)
            return bid
        except PyMongoError as e:
            print(f"Error finding bid: {e}")
            return None

    def find_many_bids(filter: Dict[str, Any]) -> List[Dict[str, Any]]:
        try:
            bids = list(db.bids.find(filter))
            return bids
        except PyMongoError as e:
            print(f"Error finding bids: {e}")
            return []

    def update_one_bid(filter: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        try:
            result = db.bids.update_one(filter, {"$set": update_data})
            return result.modified_count > 0
        except PyMongoError as e:
            print(f"Error updating bid: {e}")
            return False

    def update_many_bids(filter: Dict[str, Any], update_data: Dict[str, Any]) -> int:
        try:
            result = db.bids.update_many(filter, {"$set": update_data})
            return result.modified_count
        except PyMongoError as e:
            print(f"Error updating bids: {e}")
            return 0

    def delete_one_bid(filter: Dict[str, Any]) -> bool:
        try:
            result = db.bids.delete_one(filter)
            return result.deleted_count > 0
        except PyMongoError as e:
            print(f"Error deleting bid: {e}")
            return False

    def delete_many_bids(filter: Dict[str, Any]) -> int:   
        try:
            result = db.bids.delete_many(filter)  
            return result.deleted_count
        except PyMongoError as e:
            print(f"Error deleting bids: {e}")
            return 0

