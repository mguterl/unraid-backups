import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class UnraidBackupsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const metric = new cloudwatch.Metric({
      namespace: 'Unraid',
      metricName: 'BackupDuration',
      period: cdk.Duration.hours(1),
      statistic: 'SampleCount',
    });

    const user = new iam.User(this, 'UnraidBackupUser');
    const accessKey = new iam.CfnAccessKey(this, 'UnraidBackupAccessKey', {
      userName: user.userName,
    });
    new cdk.CfnOutput(this, 'UnraidBackupAccessKeyId', {
      value: accessKey.ref,
    });
    new cdk.CfnOutput(this, 'UnraidBackupSecretAccessKey', {
      value: accessKey.attrSecretAccessKey,
    });

    cloudwatch.Metric.grantPutMetricData(user);

    const topic = new sns.Topic(this, 'BackupMonitoringTopic');

    const email = ssm.StringParameter.valueForStringParameter(this, '/unraid/backups/email');
    topic.addSubscription(
      new snsSubscriptions.EmailSubscription(email)
    );

    const alarm = new cloudwatch.Alarm(this, 'NoBackupAlarm', {
      metric: metric,
      evaluationPeriods: 24,
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      alarmDescription: 'No backup has occurred in the last 24 hours',
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });

    alarm.addAlarmAction(new cloudwatchActions.SnsAction(topic));
  }
}
