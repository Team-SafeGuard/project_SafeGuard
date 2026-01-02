import os
import sys

def read_log(filename):
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return
    
    with open(filename, 'rb') as f:
        data = f.read()
        # Try different encodings
        for enc in ['cp949', 'utf-8', 'euc-kr']:
            try:
                print(f"--- Decoding with {enc} ---")
                print(data.decode(enc, 'ignore'))
                break
            except Exception as e:
                print(f"Failed {enc}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        read_log(sys.argv[1])
    else:
        read_log('debug_err.txt')
