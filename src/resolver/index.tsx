import { IType } from '../types/IType';
import Input from '../input/index';

export default function resolveInput(type: IType) {
    if (
        (type.name === 'object' || type.jsonType === 'object')
        && type.options
        && type.options.i18n === true
    ) {
        return Input;
    }
}