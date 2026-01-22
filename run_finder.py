#!/usr/bin/env python3
"""Run level_finder.test.ts with multiple threads until one succeeds."""

import os
import subprocess
import sys
import threading
import multiprocessing

# Lock for stdout printing and run counter
print_lock = threading.Lock()
run_counter = 0


def run_finder(target_percent: int, success_flag: list, result_holder: list):
    """Run a single finder instance. Sets success_flag and stores output on RC=0."""
    global run_counter
    with print_lock:
        run_counter += 1
        run_id = run_counter

    cmd = ["npx", "tsx", "level_finder.test.ts", str(target_percent)]

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    stdout, stderr = process.communicate()

    if process.returncode == 0:
        with print_lock:
            if not success_flag[0]:
                success_flag[0] = True
                result_holder.append(stdout)
                print(f"\n[SUCCESS] Run #{run_id} with target {target_percent}% succeeded!")
                print("=" * 60)
                print(stdout)
                if stderr:
                    print("[stderr]", stderr, file=sys.stderr)
                print("=" * 60)
    else:
        with print_lock:
            print(f"[FAIL] Run #{run_id} target={target_percent}% RC={process.returncode}", file=sys.stderr)
            if stderr:
                print(stderr, file=sys.stderr)


def worker(target_percent: int, success_flag: list, result_holder: list):
    """Worker that keeps spawning new finder processes until success."""
    while not success_flag[0]:
        run_finder(target_percent, success_flag, result_holder)


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <target_percent>", file=sys.stderr)
        sys.exit(1)

    target_percent = sys.argv[1]

    # Get number of CPU cores
    num_threads = multiprocessing.cpu_count()
    print(f"Using {num_threads} threads")
    print(f"Target percent: {target_percent}%")
    print("Press Ctrl+C to stop\n")

    success_flag = [False]
    result_holder = []

    threads = []
    for _ in range(num_threads):
        t = threading.Thread(target=worker, args=(target_percent, success_flag, result_holder), daemon=True)
        t.start()
        threads.append(t)

    # Wait for success
    while not success_flag[0]:
        for t in threads:
            t.join(timeout=0.1)
            if success_flag[0]:
                break

    if success_flag[0]:
        sys.exit(0)
    else:
        print("\nNo successful runs found")
        sys.exit(1)


if __name__ == "__main__":
    main()
