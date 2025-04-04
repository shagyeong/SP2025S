#from django.urls import path
#from . import views

#app_name = 'team'

#urlpatterns = [
#    path('', views.team_view, name='team'),
#]
from django.urls import path
from .views import TeamCreateView, TeamDetailView, TeamListView

app_name = 'team'
urlpatterns = [
    path('teams', TeamCreateView.as_view(), name='team-list-create'),
    path('teams/<str:team_id>', TeamDetailView.as_view(), name='team-detail'),
    path('team_list/', TeamListView.as_view(), name='team-list'),
]

