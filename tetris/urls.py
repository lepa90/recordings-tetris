from django.urls import path
from . import views

urlpatterns = [
    path('', views.tetris_view, name='tetris'),
]
