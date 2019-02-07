import { spawn, execSync, ChildProcess } from 'child_process';
import path from 'path';
import {
  CodeError,
  ERR_UNPROCESSABLE_PID,
  ERR_CANNOT_GET_APP_PID,
  ERR_CANNOT_CLEAN_LOGCAT_BUFFER,
  ERR_CANNOT_START_LOGCAT,
} from '../errors';

export function runLoggingProcess(adbPath?: string): ChildProcess {
  const execPath = getAbdPath(adbPath);
  return spawnLogcatProcess(execPath);
}

export function getAbdPath(customPath?: string): string {
  if (customPath) {
    return path.resolve(customPath);
  }

  return process.env.ANDROID_HOME
    ? `${process.env.ANDROID_HOME}/platform-tools/adb`
    : 'adb';
}

export function spawnLogcatProcess(adbPath: string): ChildProcess {
  try {
    execSync(`${adbPath} logcat -c`);
  } catch (error) {
    throw new CodeError(
      ERR_CANNOT_CLEAN_LOGCAT_BUFFER,
      (error as Error).message
    );
  }

  try {
    return spawn(adbPath, ['logcat', '-v', 'time', 'process', 'tag'], {
      stdio: 'pipe',
    });
  } catch (error) {
    throw new CodeError(ERR_CANNOT_START_LOGCAT, (error as Error).message);
  }
}

export function getApplicationPid(
  applicationId: string,
  adbPath?: string
): number {
  let output: Buffer | undefined;
  try {
    output = execSync(`${getAbdPath(adbPath)} shell pidof -s ${applicationId}`);
  } catch (error) {
    throw new CodeError(ERR_CANNOT_GET_APP_PID, (error as Error).message);
  }

  const pid = output ? parseInt(output.toString(), 10) : NaN;
  if (isNaN(pid)) {
    throw new CodeError(ERR_UNPROCESSABLE_PID);
  }

  return pid;
}