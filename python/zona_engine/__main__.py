import argparse
import json

from .engine import execute

parser = argparse.ArgumentParser(description="Pegasus Zona authorized workflow engine")
parser.add_argument("command")
parser.add_argument("target")
args = parser.parse_args()
print(json.dumps(execute(args.command, args.target), indent=2))
