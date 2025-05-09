import baseConfig from '@/config/base.config';

export class SubjectFactory {
  static buildSubject(messageType: string, action: string): string {
    return [
      baseConfig.subject.level1_company,
      baseConfig.subject.level2_facility,
      baseConfig.subject.level3_productionLine,
      baseConfig.subject.level4_environment,
      baseConfig.subject.level5_serviceCategory,
      baseConfig.subject.level6_serviceName,
      messageType,
      action,
      baseConfig.subject.level9_instanceId,
    ].join('.');
  }
}
