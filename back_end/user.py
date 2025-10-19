
from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, _id, email):
        self.id = str(_id)
        self.email = email
        
def user_from_record(rec):
    if rec:
        return User(rec["_id"], rec.get("email"),"")
    else:
        None