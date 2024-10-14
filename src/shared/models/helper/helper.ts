import { ErrorConstant } from 'src/constants/error';
import { IResource } from 'src/constants/interfaces';
import { ResourceConstant } from 'src/constants/resources';
import { DbError } from 'src/shared/interfaces/db-error/db-error.interface';

export class Helper {
  public static templateToString(template: string, msgVars: {} = {}): string {
    const TEMPLATE_REGEX = /\{(.+)\}/g;

    let match = TEMPLATE_REGEX.exec(template);

    while (match !== null) {
      if (!msgVars[match[1]]) {
        msgVars[match[1]] = '`UNK`';
      }

      template = template.replace(match[0], msgVars[match[1]]);

      match = TEMPLATE_REGEX.exec(template);
    }

    return template;
  }

  public static generateCode(
    totalLen: number = 32,
    parts: number = 1,
    separator: string = '',
    onlyNumber: boolean = false,
  ) {
    if (onlyNumber) {
      return Math.random()
        .toFixed(totalLen)
        .substr(parseInt('-' + totalLen.toString()));
    }

    const eachLen = totalLen / parts;

    let generatedCode = [];

    for (let i = 0; i < parts; i++) {
      generatedCode.push(this.getRandomId(eachLen));
    }

    return generatedCode.join(separator);
  }

  private static getRandomId(len: number = 8): string {
    let strToReplace = '';

    for (let i = 0; i < len; i++) {
      strToReplace += i % 2 === 0 ? 'x' : 'y';
    }

    return strToReplace.replace(/[xy]/g, (char) => {
      const rand = (Math.random() * 16) | 0;

      const val = char == 'x' ? rand : (rand & 0x3) | 0x8;

      return val.toString(16);
    });
  }

  public static getDbErr(error: any): DbError {
    return {
      error:
        error && ErrorConstant[error.split('__')[0]]
          ? ErrorConstant[error.split('__')[0]]
          : ErrorConstant.UNKNOWN_ERROR,
      msgVars: {
        field: error && error.split('__')[1] ? error.split('__')[1] : error,
        message: error && error.split('__')[1] ? error.split('__')[1] : error,
      },
    };
  }

  public static getResourceConstant(verb: string, endpoint: string): IResource {
    verb = verb.toUpperCase();

    endpoint = endpoint.split('?')[0].replace(/[\/\s]*$/, '');

    let resourceConstants: Array<IResource> = Object.values(ResourceConstant);

    for (let i = 0; i < resourceConstants.length; i++) {
      let resourceConstant = resourceConstants[i] as IResource;

      if (!resourceConstant.verb || !resourceConstant.endpoint) {
        continue;
      }

      if (
        resourceConstant.verb.toUpperCase() === verb &&
        resourceConstant.endpoint.toLowerCase() === endpoint.toLowerCase()
      ) {
        return <IResource>resourceConstant;
      }
    }

    return null;
  }

  public static pad(num: number, length: number = 4) {
    return new Array(length)
      .concat([Math.abs(num)])
      .join('0')
      .slice(-length);
  }
}
