"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const os = require("os");
const tl = require("azure-pipelines-task-lib/task");
var uuidV4 = require('uuid/v4');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            // Get inputs.
            let _vsts_input_errorActionPreference = tl.getInput('errorActionPreference', false) || 'Stop';
            switch (_vsts_input_errorActionPreference.toUpperCase()) {
                case 'STOP':
                case 'CONTINUE':
                case 'SILENTLYCONTINUE':
                    break;
                default:
                    throw new Error(tl.loc('JS_InvalidErrorActionPreference', _vsts_input_errorActionPreference));
            }
            let scriptType = tl.getInput('ScriptType', /*required*/ true);
            let scriptPath = tl.getPathInput('ScriptPath', false);
            let scriptInline = tl.getInput('Inline', false);
            let scriptArguments = tl.getInput('ScriptArguments', false);
            let _vsts_input_failOnStandardError = tl.getBoolInput('FailOnStandardError', false);
            let targetAzurePs = tl.getInput('TargetAzurePs', false);
            let customTargetAzurePs = tl.getInput('CustomTargetAzurePs', false);
            let serviceName = tl.getInput('ConnectedServiceNameARM', /*required*/ true);
            //let endpointObject= await new AzureRMEndpoint(serviceName).getEndpoint();
            let input_workingDirectory = tl.getPathInput('workingDirectory', /*required*/ true, /*check*/ true);
            // string constants
            let otherVersion = "OtherVersion";
            if (targetAzurePs == otherVersion) {
                if (customTargetAzurePs != "") {
                    targetAzurePs = customTargetAzurePs;
                }
                else {
                    console.log(tl.loc('InvalidAzurePsVersion', customTargetAzurePs));
                }
            }
            else {
                targetAzurePs = "";
            }
            var endpoint = "";
            if (scriptType.toUpperCase() == 'FILEPATH') {
                if (!tl.stats(scriptPath).isFile() || !scriptPath.toUpperCase().match(/\.PS1$/)) {
                    throw new Error(tl.loc('JS_InvalidFilePath', scriptPath));
                }
            }
            // Generate the script contents.
            console.log(tl.loc('GeneratingScript'));
            let contents = [];
            let azFilePath = path.join(path.resolve(__dirname), 'InitializeAz.ps1');
            contents.push(`$ErrorActionPreference = '${_vsts_input_errorActionPreference}'`);
            if (targetAzurePs == "") {
                contents.push(`${azFilePath} -endpoint '${endpoint}'`);
            }
            else {
                contents.push(`${azFilePath} -endpoint '${endpoint}' -targetAzurePs  ${targetAzurePs}`);
            }
            if (scriptType.toUpperCase() == 'FILEPATH') {
                contents.push(`. '${scriptPath.replace(/'/g, "''")}' ${scriptArguments}`.trim());
                console.log(tl.loc('JS_FormattedCommand', contents[contents.length - 1]));
            }
            else {
                contents.push(scriptInline);
            }
            // Write the script to disk.
            tl.assertAgent('2.115.0');
            let tempDirectory = tl.getVariable('agent.tempDirectory');
            tl.checkPath(tempDirectory, `${tempDirectory} (agent.tempDirectory)`);
            let filePath = path.join(tempDirectory, uuidV4() + '.ps1');
            yield fs.writeFile(filePath, '\ufeff' + contents.join(os.EOL), callback); // Since UTF8 encoding is specified, node will
            // encode the BOM into its UTF8 binary sequence.
            // Run the script.
            //
            // Note, prefer "pwsh" over "powershell". At some point we can remove support for "powershell".
            //
            // Note, use "-Command" instead of "-File" to match the Windows implementation. Refer to
            // comment on Windows implementation for an explanation why "-Command" is preferred.
            let powershell = tl.tool(tl.which('pwsh') || tl.which('powershell') || tl.which('pwsh', true))
                .arg('-NoLogo')
                .arg('-NoProfile')
                .arg('-NonInteractive')
                .arg('-ExecutionPolicy')
                .arg('Unrestricted')
                .arg('-Command')
                .arg(`. '${filePath.replace(/'/g, "''")}'`);
            let options = {
                cwd: input_workingDirectory,
                failOnStdErr: false,
                errStream: process.stdout,
                outStream: process.stdout,
                ignoreReturnCode: true
            };
            // Listen for stderr.
            let stderrFailure = false;
            if (_vsts_input_failOnStandardError) {
                powershell.on('stderr', (data) => {
                    stderrFailure = true;
                });
            }
            // Run bash.
            let exitCode = yield powershell.exec(options);
            // Fail on exit code.
            if (exitCode !== 0) {
                tl.setResult(tl.TaskResult.Failed, tl.loc('JS_ExitCode', exitCode));
            }
            // Fail on stderr.
            if (stderrFailure) {
                tl.setResult(tl.TaskResult.Failed, tl.loc('JS_Stderr'));
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed');
        }
    });
}
function callback() { }
run();
