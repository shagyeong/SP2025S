from django.core.management.base import BaseCommand
from team.models import Team
from mainpage.views import create_notion_page

class Command(BaseCommand):
    help = '팀에 Notion 공유문서를 자동 생성하고 notion_url 필드를 채웁니다.'

    def handle(self, *args, **kwargs):
        for team in Team.objects.all():
            if not team.notion_url:
                self.stdout.write(f"⏳ {team.team_name} 문서 생성 중...")
                url = create_notion_page(team.team_name)
                if url:
                    team.notion_url = url
                    team.save()
                    self.stdout.write(self.style.SUCCESS(f"생성됨: {url}"))
                else:
                    self.stdout.write(self.style.ERROR(f"실패: {team.team_name}"))
