from django.shortcuts import render


def tetris_view(request):
	return render(request, 'tetris/index.html')
