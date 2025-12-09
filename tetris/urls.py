from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('tetris/', views.tetris_view, name='tetris'),
    path('o-nas/', views.about_view, name='about'),
]
