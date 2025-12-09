from django.shortcuts import render


def home_view(request):
	return render(request, 'tetris/home.html')


def tetris_view(request):
	return render(request, 'tetris/index.html')


def about_view(request):
	return render(request, 'tetris/about.html')
