from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

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


class UserInfo(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasReadWriteScope]

    def get(self, request, format=None):
        user = request.user
        serializer = serializers.UserSerializer(user)
        return Response(serializer.data)
