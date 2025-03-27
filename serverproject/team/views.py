from django.shortcuts import render

def team_view(request):
    return render(request, 'team/team.html')
