from django.urls import path, include

from . import views

urlpatterns = [
    path("", views.UserList.as_view()),
    path("<int:pk>/", views.UserDetail.as_view()),
    path("user-info/", views.UserInfo.as_view()),
]
