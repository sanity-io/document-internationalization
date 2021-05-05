import { ObjectSchemaTypeWithOptions } from '@sanity/types';

export function getCollapsedWithDefaults(
    options: ObjectSchemaTypeWithOptions['options'] = {},
    level: number
) {
    // todo: warn on "collapsable" and deprecate collapsible in favor of just "collapsed"
    //       --> relevant: https://github.com/sanity-io/sanity/issues/537
    if (options.collapsible === true || options.collapsable === true) {
        // collapsible explicit set to true
        return {
            collapsible: true,
            collapsed: options.collapsed !== false,
        }
    } else if (options.collapsible === false || options.collapsable === false) {
        // collapsible explicit set to false
        return {
            // hard limit to avoid infinite recursion
            collapsible: level > 9,
            collapsed: level > 9,
        }
    }
    // default
    return {
        collapsible: level > 2,
        collapsed: level > 2,
    }
}