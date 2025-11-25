from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password1', 'password2')
        extra_kwargs = {'password1': {'write_only': True}, 'password2': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password1=validated_data['password1'],
            password2=validated_data['password2']
        )
        return user