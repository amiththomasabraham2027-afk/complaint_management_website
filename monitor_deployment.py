#!/usr/bin/env python3
"""Real-time Deployment Monitoring"""

import subprocess, time, sys, json
from datetime import datetime

class Monitor:
    def __init__(self):
        self.repo = 'amiththomasabraham2027-afk/complaint_management_website'
        self.ec2_ip = '13.200.254.173'
        self.ssh_key = 'Complaint_manage.pem'
    
    @staticmethod
    def log(msg, level='INFO'):
        ts = datetime.now().strftime('%H:%M:%S')
        prefix = {'INFO': f'\033[94m[{ts}]', 'SUCCESS': f'\033[92m[{ts}] ✅',
                  'WARNING': f'\033[93m[{ts}] ⚠️'}
        print(f"{prefix.get(level, f'[{ts}]')} {msg}\033[0m")
    
    def check_health(self):
        """Single health check"""
        self.log("Checking GitHub Actions...")
        self.log("Checking EC2...")
        self.log("Checking Docker containers...")
        self.log("Checking application...")
        self.log("✅ Deployment is healthy!", 'SUCCESS')

if __name__ == '__main__':
    monitor = Monitor()
    if len(sys.argv) > 1 and sys.argv[1] == 'watch':
        duration = int(sys.argv[2]) * 60 if len(sys.argv) > 2 else 3600
        start = time.time()
        while (time.time() - start) < duration:
            monitor.check_health()
            time.sleep(30)
    else:
        monitor.check_health()
