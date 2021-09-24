/**
 * This package adds support for targeting
 * light vs dark classes in duotone icons.
 *
 * It works by adding utility classes and specific selectors
 */

import createPlugin from 'windicss/plugin'
import { reduce, kebabCase, isObject } from 'lodash'
import Colors from 'windicss/colors'

interface RuleConfig {
  name: string
  theme?: (key: string) => string
  weight?: string
  color?: string
}

const makeRuleForClass = ({ name, theme, weight, color }: RuleConfig) => {
  const resolvedColor = color ? color : weight ? theme(`colors.${name}.${weight}`) : theme(`colors.${name}`)
  let [lightKey, darkKey] = [`.icon-light-${name}`, `.icon-dark-${name}`]

  // transparent, black, and white
  if (weight) {
    lightKey += `-${weight}`
    darkKey += `-${weight}`
  }

  return {
    // When we're targeting an svg with icon-light-red-500
    // only attach the fill and stroke for those same icons
    // and vice versa for icon-dark
    [lightKey]: {
      '> *[fill].icon-light': {
        fill: resolvedColor,
      },
      '> *[stroke].icon-light': {
        stroke: resolvedColor,
      },
    },
    [darkKey]: {
      '> *[fill].icon-dark': {
        fill: resolvedColor,
      },
      '> *[stroke].icon-dark': {
        stroke: resolvedColor,
      },
    },
  }
}

function addIconUtilityClasses (theme) {
  return reduce(Colors, (acc, variants, colorName) => {
    // lightGray => light-gray
    const name = kebabCase(colorName)

    // Collect the classes we're going to add to the windicss class registry
    let additionalClasses = {}

    // There are both nested and not-nested colors (e.g. black, white)
    if (isObject(variants)) {
      // multiple levels of colors
      additionalClasses = reduce(variants, (variantAcc, _, weight) => {
        const rules = makeRuleForClass({ name, theme, weight })

        return { ...variantAcc, ...rules }
      }, {})
    } else {
      // single values like black, white
      additionalClasses = makeRuleForClass({ name, theme })
    }

    // Output is an object where each new class is a key
    // And the selectors and values affected are values
    /**
     * {
     *  `.icon-light-green-500`: {
     *    '> *[stroke].icon-light': {
     *      stroke: resolvedColor
     *    },
     *    '> *[fill].icon-light': {
     *      fill: resolvedColor
     *    }
     *  }
     * }
     */
    return { ...acc, ...additionalClasses }
  }, {

    // These technically aren't under "colors"
    ...makeRuleForClass({ name: 'transparent', color: 'transparent' }),
    ...makeRuleForClass({ name: 'current', color: 'currentColor' }),
  })
}

export const IconDuotoneColorsPlugin = createPlugin(({ theme, addUtilities }) => {
  addUtilities(addIconUtilityClasses(theme))
})
