import subprocess
import threading

url = "https://www.cyclopt.com/"

max_time = 10  # in seconds

cmd = ["perl", "nikto/program/nikto.pl", "-url", url]
proc = subprocess.Popen(cmd, stdout=open('logfile', 'w'), encoding="UTF8")

timer = threading.Timer(max_time, lambda proc: proc.kill(), (proc, ))
timer.start()
proc.wait()
timer.cancel()
