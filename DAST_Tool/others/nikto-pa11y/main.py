# !/usr/bin/python3
import subprocess
import ast
import pandas as pd
import threading
import argparse
import json

# Parse input arguments
parser = argparse.ArgumentParser(
    description='Create a security-accessibility HTML Report.')


def max_time_validate(x):
    x = int(x)
    if x < 10:
        raise argparse.ArgumentTypeError("Minimum duration is 5 seconds.")
    return x


parser.add_argument('-u', '--url', action='store',
                          dest='url', help='The website url to scan. [eg. http://www.example.com]', required=True)
parser.add_argument('-o', '--out', action='store',
                          dest='out', help='Output html file.', required=True)
parser.add_argument('-t', '--time', type=max_time_validate, action='store', dest='max_time',
                    default=30, help='Max duration for the security scan in seconds (default: 30).')
args = parser.parse_args()
url = args.url
out_file = args.out
max_time = args.max_time

print("Please wait...")

# Scan website using pa11y
pa11y_proc = subprocess.run(
    ["pa11y", "-r", "json", url], shell=True, encoding="utf8", stdout=subprocess.PIPE)

# Save results as a dataframe
pd.set_option('colheader_justify', 'center')
df_pa11y = pd.DataFrame(ast.literal_eval(pa11y_proc.stdout))
df_pa11y.index += 1

# Scan website using yellowlab
# yellowlab_proc = subprocess.run(
#     ["yellowlabtools", url], shell=True, encoding="utf8", stdout=subprocess.PIPE)
# df_yellowlab = pd.DataFrame(json.loads(yellowlab_proc.stdout))


# Scan website using nikto
nikto_proc = subprocess.Popen(
    ["perl", "nikto/program/nikto.pl", "-url", url], stdout=subprocess.PIPE, encoding="UTF8")

# Kill nikto process after max_time
timer = threading.Timer(max_time, lambda p: p.kill(), (nikto_proc, ))
timer.start()
nikto_proc.wait()
timer.cancel()
nikto_proc.terminate()
nikto_str = nikto_proc.stdout.read()


# Edit results
def niktoStrToDFs(str):

    lst = str.split(
        "---------------------------------------------------------------------------")
    del lst[0]
    del lst[1]

    for i, _ in enumerate(lst):
        lst[i] = ' '.join(lst[i].split())
        lst[i] = lst[i].replace("+ ", "{\"", 1)
        lst[i] = lst[i].replace(" + ", "\",\"") + "\"}"

    lst[0] = lst[0].replace(": ", "\":\"")

    new_lst = [ast.literal_eval(x) for x in lst]

    return pd.DataFrame([new_lst[0]]), pd.DataFrame(new_lst[1], columns=['Warning/Vulnerability Message'])


df_target_info, df_vuln_info = niktoStrToDFs(nikto_str)
df_vuln_info.index += 1

# Create HTML string
html_str = '''
<html>
  <head><title>Security Report</title></head>
  <link rel="stylesheet" type="text/css" href="df_style.css"/>
  <body>
    <h1> Security </h1>
    {sec_table1}
    </br>
    {sec_table2}
    </br>
    <h1> Accessibility </h1>
    </br>
    {acc_table} 
    </br></br>
  </body>
</html>.
'''

# Save it as an HTML file
with open(out_file, 'w') as f:
    f.write(html_str.format(
        acc_table=df_pa11y.to_html(classes='mystyle'),
        sec_table1=df_target_info.to_html(classes='mystyle', index=False),
        sec_table2=df_vuln_info.to_html(classes='mystyle'),
        # per_table=df_yellowlab.to_html(classes='mystyle'),
    ))

print("Successfuly saved as " + out_file + ".")
