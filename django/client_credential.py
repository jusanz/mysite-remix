import os
import base64

client_id = os.environ.get("DJANGO_CLIENT_ID")
secret = os.environ.get("DJANGO_CLIENT_SECRET")

credential = "{0}:{1}".format(client_id, secret)
credential = base64.b64encode(credential.encode("utf-8"))
