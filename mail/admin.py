from django.contrib import admin
from django.contrib.auth import models

# Register your models here.
from .models import User,Email

admin.site.register(User)
admin.site.register(Email)