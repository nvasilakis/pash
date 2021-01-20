// A controller implementation that uses AWS

const { respond, getRequestBody } = require('./lib.js');
const SSM = require('@aws-sdk/client-ssm');

const region = "us-east-1";

const ssm = new SSM.SSMClient({ region });

const assignment = (assignees) =>
    new SSM.SendCommandCommand({
        DocumentName: 'AWS-RunShellScript',
        DocumentVersion: '1',
        Targets: [{Key: 'tag:Pash', Values: [assignees] }],
        OutputS3BucketName: 'pash-reports',
        Parameters: {
            commands: ['/home/ubuntu/worker-script.sh'],
            workingDirectory: ['/home/ubuntu'],
            executionTimeout: ['3600']
        },
    });



const buildCommandStatusUrl = (commandId) =>
      `https://console.aws.amazon.com/systems-manager/run-command/${commandId}?region=us-east-1`;

// Tells every EC2 instance responsible for correctness tests to run their scripts.
const ci = async (req, res) => {
    try {
        const { '$metadata': { httpStatusCode }, Command } = await ssm.send(assignment('ci-correctness'));

        if (httpStatusCode === 200) {
            const { CommandId }  = Command;
            log(`Started command ${buildCommandStatusUrl(CommandId)}`)
            respond(res, 200, `Sent. Check status using the link below.\n`);
        } else {
            respond(res, 500, `AWS SSM responded with error code ${httpStatusCode}\n`);
        }
    } catch (e) {
        err(e);
        respond(res, 500, `Failed to distribute work to ci workers.\n`);
    }
};


// Reports instance history
// TODO: Upgrade to HTML response so that links can take user to exact command pages in AWS.
const now = async (req, res) => {
    try {
        const command = new SSM.ListCommandInvocationsCommand({ details: true });

        const { '$metadata': { httpStatusCode }, CommandInvocations: history } = await ssm.send(command);
        console.log(history[0]);
        
        if (httpStatusCode === 200) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });

            const groupedHistory = history.reduce((res, item) => {
                const { InstanceName: id } = item;
                const existing = res[id] || [];
                return Object.assign(res, { [id]: existing.concat([item]) });
            }, {});

            const sortedHistory = Object.entries(groupedHistory).sort(([a,],[b,]) => b.localeCompare(a));

            for (const [id, instanceHistory] of sortedHistory) {
                if (id === '') continue;

                res.write(`Instance ${id}\n`);
                for (const { CommandId, RequestedDateTime, Status } of instanceHistory) {
                    res.write(`${RequestedDateTime.toISOString()} ${Status} ${CommandId}\n`);
                }
                res.write(`\n\n`);
            }

            res.end();
        } else {
            respond(res, 500, `AWS SSM responded with error code ${httpStatusCode}`);
        }
    } catch (e) {
        err(e);
    }
};


module.exports = {
    '/now': now,
    '/ci': ci,
};