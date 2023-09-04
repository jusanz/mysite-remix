from django.shortcuts import render

from rest_framework import generics, permissions

from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope

from . import models, serializers

class UserList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer

class UserDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer
