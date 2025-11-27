from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'password_confirm')
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password': "As senhas não conferem."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user