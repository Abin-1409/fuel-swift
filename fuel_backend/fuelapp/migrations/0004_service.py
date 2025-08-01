# Generated by Django 5.2.3 on 2025-06-21 03:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fuelapp', '0003_alter_customuser_options_alter_customuser_managers_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(choices=[('petrol', 'Petrol'), ('diesel', 'Diesel'), ('ev', 'EV Charging'), ('air', 'Air Filling'), ('mechanical', 'Mechanical Work')], max_length=20)),
                ('description', models.TextField()),
                ('stock', models.IntegerField(default=0)),
                ('unit', models.CharField(max_length=20)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='INR', max_length=3)),
                ('status', models.CharField(choices=[('active', 'Active'), ('inactive', 'Inactive'), ('maintenance', 'Maintenance')], default='active', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
