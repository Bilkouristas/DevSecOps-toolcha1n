import subprocess
import threading

url = "https://www.cyclopt.com/"

max_time = 10  # in seconds

cmd = ["perl", "nikto/program/nikto.pl", "-url", url]
# cmd = ["C:/Users/Kostas/AppData/Roaming/npm/pa11y.cmd", "-r", "json", url]

proc = subprocess.Popen(
    cmd, stdout=subprocess.PIPE, encoding="UTF8", universal_newlines=True)

timer = threading.Timer(max_time, lambda p: p.kill(), (proc, ))
timer.start()
proc.wait()
timer.cancel()
proc.terminate()
# print(proc.stdout)
print(proc.stdout.read())
