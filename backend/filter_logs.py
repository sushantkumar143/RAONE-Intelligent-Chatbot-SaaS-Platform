import sys
import re

with open("rag_logs.txt", "r") as f:
    lines = f.readlines()

clean_lines = []
for line in lines:
    if "sqlalchemy" not in line and "httpx" not in line and "sentence_transformers" not in line:
        clean_lines.append(line.rstrip())

with open("clean_rag_logs.txt", "w") as f:
    f.write("\n".join(clean_lines))

print("Clean logs saved.")
