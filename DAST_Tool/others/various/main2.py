import subprocess
import ast
import pandas as pd
import time

url = "https://www.cyclopt.com/"
out_file = 'result.html'


def run_proc(command):
    proc = subprocess.run(command, shell=True, encoding="utf8",
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    return pd.DataFrame(ast.literal_eval(proc.stdout))


pa11y_df = run_proc(["pa11y", "-r", "json", url])
# nikto_df = run_proc(["perl", "nikto/program/nikto.pl",
#                      "-url", url, "-o", "tetsing.json"])
nikto_df = run_proc(["pa11y", "-r", "json", url])


pd.set_option('colheader_justify', 'center')

html_str = '''
<html>
  <head><title>HTML Pandas Dataframe with CSS</title></head>
  <link rel="stylesheet" type="text/css" href="df_style.css"/>
  <body>
    <h1> Accessibility </h1>
    </br></br>
    {acc_table}
    </br></br>
    <h1> Security </h1>
    </br></br>
    {sec_table}
  </body>
</html>.
'''

with open(out_file, 'w') as f:
    f.write(html_str.format(
        acc_table=pa11y_df.to_html(classes='mystyle'),
        sec_table=nikto_df.to_html(classes='mystyle'),
    ))
