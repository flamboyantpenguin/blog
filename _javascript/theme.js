/*
 * Originally from cotes2020/jekyll-theme-chirpy
 * © 2019 Cotes Chung (MIT License)
 *
 * Modified by flamboyantpenguin
 */
/**
 * Theme management class
 *
 * To reduce flickering during page load, this script should be loaded synchronously.
 */
class Theme {

  static get ID() {
    return 'theme-mode';
  }

  static get #colorscheme() {
    return (
      sessionStorage.getItem('color-scheme') ||
      document.documentElement.getAttribute('color-scheme')
    );
  }

  static get #mode() {
    return (
      sessionStorage.getItem('color-mode') ||
      document.documentElement.getAttribute('color-mode')
    );
  }

  static get currentColorScheme() {
    return this.#colorscheme;
  }

  static get #hasMode() {
    return this.#mode !== null;
  }

  /**
   * Sets the theme to a custom string value.
   *
   * @param {string} themeName The name of the custom theme to set.
   */
  static set(themeName) {
    if (typeof themeName === 'string') {
      document.documentElement.setAttribute('color-scheme', themeName);
      sessionStorage.setItem('color-scheme', themeName);
      this.#notify();
    }
  }

  static getModeMapper(light, dark) {
    return {
      [this.LIGHT]: light,
      [this.DARK]: dark
    };
  }

  static get #sysDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  static flip() {
    if (this.#hasMode) {
      this.#clearMode();
    } else {
      this.#sysDark ? this.#setLight() : this.#setDark();
    }
    this.#notify();
  }

  static #setDark() {
    document.documentElement.setAttribute('color-mode', this.DARK);
    sessionStorage.setItem('color-mode', this.DARK);
  }

  static #setLight() {
    document.documentElement.setAttribute('color-mode', this.LIGHT);
    sessionStorage.setItem('color-mode', this.LIGHT);
  }

  static #clearMode() {
    document.documentElement.removeAttribute('color-mode');
    sessionStorage.removeItem('color-mode');
  }

  /**
   * Clears the current theme, reverting to a default state.
   */
  static clear() {
    document.documentElement.removeAttribute('color-mode');
    sessionStorage.removeItem('color-scheme');
    this.#notify();
  }

  /**
   * Notifies other plugins that the theme mode has changed
   */
  static #notify() {
    window.postMessage({ id: this.ID }, '*');
  }

  static init() {
    // Thanks to https://gist.github.com/endel/dfe6bb2fbe679781948c

    /*
     * modified from http://www.voidware.com/moon_phase.htm
     */
    function getMoonPhase(year, month, day) {
      let centuryCalc = 0;
      let monthCalc = 0;
      let julianIndex = 0;
      let phaseIndex = 0;


      if (month < 3) {
        year--;
        month += 12;
      }

      ++month;

      centuryCalc = 365.25 * year;

      monthCalc = 30.6 * month;

      julianIndex = centuryCalc + monthCalc + day - 694039.09; //jd is total days elapsed

      julianIndex /= 29.5305882; //divide by the moon cycle

      phaseIndex = parseInt(julianIndex); //int(jd) -> b, take integer part of jd

      julianIndex -= phaseIndex; //subtract integer part to leave fractional part of original jd

      phaseIndex = Math.round(julianIndex * 8); //scale fraction from 0-8 and round

      if (phaseIndex >= 8) {
        phaseIndex = 0; //0 and 8 are the same so turn 8 into 0
      }

      // 0 => New Moon
      // 1 => Waxing Crescent Moon
      // 2 => Quarter Moon
      // 3 => Waxing Gibbous Moon
      // 4 => Full Moon
      // 5 => Waning Gibbous Moon
      // 6 => Last Quarter Moon
      // 7 => Waning Crescent Moon

      return phaseIndex;
    }

    var date = new Date();

    if (date.getDate() == "1" && date.getMonth() == "0") {
      this.set("spincomplete");
    }
    else if (getMoonPhase(date.getFullYear(), date.getMonth(), date.getDate()) == 4 && date.getHours() > 21) {
      this.set("moon");
    }
    else {
      switch (date.getDay()) {
        case 0:
          this.set('freedom');
          break;
        case 1:
          this.set('contracts');
          break;
        case 2:
          this.set('eternity');
          break;
        case 3:
          this.set('wisdom');
          break;
        case 4:
          this.set('justice');
          break
        case 5:
          this.set('war');
          break;
        case 6:
          this.set('love');
          break;
        default:
          this.set('default');
      }
    }
  }
}

Theme.init()

export default Theme;
