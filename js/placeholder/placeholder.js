const path        = require('path');

module.exports = randomString({
  girls:      require(path.join(__dirname, 'girls.js')),
  boys:       require(path.join(__dirname, 'boys.js')),
  prefixes:   require(path.join(__dirname, 'prefixes.js')),
  verbs:      require(path.join(__dirname, 'verbs.js')),
  objects:    require(path.join(__dirname, 'objects.js')),
  places:     require(path.join(__dirname, 'places.js')),
  adjectives: require(path.join(__dirname, 'adjectives.js')),
  endings:    require(path.join(__dirname, 'endings.js')),
});

function randomString(options) {
  let o = options || {};
  return function() {
    let girls      = o.girls      ? o.girls.slice(0)
                                  : 'Mary | Sue'.split(' | ');
    let boys       = o.boys       ? o.boys.slice(0)
                                  : 'Fred | Dave'.split(' | ');
    let prefixes   = o.prefixes   ? o.prefixes.slice(0)
                                  : 'gladly | slowly'.split(' | ');
    let verbs      = o.verbs      ? o.verbs.slice(0)
                                  : 'likes $object | $was happy'.split(' | ');
    let objects    = o.objects    ? o.objects.slice(0)
                                  : '$themself | $adj apple | some grass | the chair | water'.split(' | ');
    let places     = o.places     ? o.places.slice(0)
                                  : 'in the park | with $their friends'.split(' | ');
    let adjectives = o.adjectives ? o.adjectives.slice(0)
                                  : 'a small | an enormous'.split(' | ');
    let endings    = o.endings    ? o.endings.slice(0)
                                  : 'yesterday. | with high spirits!'.split(' | ');
    let {
      prefixVerbFrequency   = 0.7,
      continuationFrequency = 0.2,
      morePeopleFrquency    = 0.1,
      adjectiveFrequency    = 0.7,
    } = options;
    let genders = {
      male: {
        they: 'he',
        their: 'his',
        them: 'him',
        themself: 'himself',
        was: 'was'
      },
      female: {
        they: 'she',
        their: 'her',
        them: 'her',
        themself: 'herself',
        was: 'was'
      },
      plural: {
        they: 'they',
        their: 'their',
        them: 'them',
        themself: 'themselves',
        was: 'were'
      }
    };
    let subjects = undefined;
    let gender = Math.ceil(Math.random() * (girls.length + boys.length));
    if (gender < girls.length) {
      gender = 'female';
      subjects = girls;
    } else {
      gender = 'male';
      subjects = boys;
    };
    let peopleConnectors = [
      ' and',
      ', then'
    ];
    let phraseConnectors = undefined;
    let phrase = '';
    let protagonist;
    addPeople();
    buildPhraseConnectors();
    addVerbObject();
    addEnding();
    return {
      phrase,
      info: {
        protagonist,
      },
    };

    function addPeople() {
      let person = randomPerson();
      protagonist = protagonist || person;
      phrase += fillPlaceholders(person);
      subjects = girls.concat(boys);
      if (subjects.length && Math.random() < morePeopleFrquency) {
        phrase += itemFrom(peopleConnectors, true) + ' ';
        gender = 'plural';
        addPeople();
      }
    }

    function addVerbObject() {
      if (!verbs.length || !subjects.length || !objects.length) { return };
      if (prefixes.length && Math.random() < prefixVerbFrequency) {
        phrase += itemFrom(prefixes, false);
      }
      phrase += randomVerb();
      if (verbs.length && subjects.length && objects.length && Math.random() < continuationFrequency) {
        phrase += itemFrom(phraseConnectors, true);
        addVerbObject();
      }
    }

    function addEnding() {
      let chance = _chance(20);
      if (Math.random() > 0.8) {
        phrase += randomEnding();
      } else {
        let rnd = Math.random() * chance;
        phrase += chance(10) ? '.' : chance(4) ? '!' : chance(4) ? '?' : chance(1) ? '...' : '?!?';
      }
    }

    function _chance(index) {
      let rnd = Math.random() * index;
      let upto = 0;
      return function(val) {
        upto += val;
        if (upto >= rnd) {
          return true;
        }
        return false;
      };
    }

    function itemFrom(array, safe) {
      if (!!safe) {
        return array[Math.floor(Math.random() * array.length)];
      }
      return array.splice(Math.floor(Math.random() * array.length), 1)[0];
    }

    function randomAdjective() {
      return genderise(itemFrom(adjectives, true));
    }

    function randomEnding() {
      return fillPlaceholders(genderise(itemFrom(endings, true)));
    }

    function randomVerb() {
      let verb = itemFrom(verbs, false);
      if (places.length && Math.random() > 0.9 && !/\$place/.test(verb)) {
        if (!/\$place/.test(verb)) {
          phrase += randomPlace();
        }
      }
      return subjectise( prefixise( genderise(fillPlaceholders(verb)) ) );
    }

    function randomObject() {
      return fillPlaceholders(genderise(itemFrom(objects, false)));
    }

    function randomPerson() {
      return fillPlaceholders(itemFrom(subjects, false));
    }

    function randomPlace() {
      return fillPlaceholders(genderise(itemFrom(places, false)));
    }

    function randomSubject() {
      let chance = _chance(2);
      return chance(1) ? randomPerson() : randomObject();
    }

    function genderise(string) {
      return string.replace('$themself', genders[gender].themself)
                    .replace('$them', genders[gender].them)
                    .replace('$their', genders[gender].their)
                    .replace('$they', genders[gender].they)
                    .replace('$was', genders[gender].was);
    }

    function prefixise(string) {
      return string.replace('$prefix', itemFrom(prefixes, false));
    }

    function subjectise(string) {
      return string.replace('$subject', randomSubject());
    }



    function fillPlaceholders(string) {
      string = fillPlaceholder(string, '$subject', randomSubject);
      string = fillPlaceholder(string, '$person', randomPerson);
      string = fillPlaceholder(string, '$object', randomObject);
      string = fillPlaceholder(string, '$object', randomObject);
      string = fillPlaceholder(string, '$a-adj',   or('a',   randomAdjective, adjectiveFrequency));
      string = fillPlaceholder(string, '$an-adj',  or('an',  randomAdjective, adjectiveFrequency));
      string = fillPlaceholder(string, '$the-adj', or('the', randomAdjective, adjectiveFrequency));
      string = fillPlaceholder(string, '$adj', randomAdjective);
      string = fillPlaceholder(string, '$verb', randomVerb);
      string = fillPlaceholder(string, '$place', randomPlace);
      return string;
    }

    function fillPlaceholder(string, placeholder, randomPhrase) {
      while (string.indexOf(placeholder) > -1) {
        string = string.replace(placeholder, stringise(randomPhrase));
      }
      return string;
    }

    function buildPhraseConnectors() {
      phraseConnectors = [
        ' and',
        ' then',
        genderise(' as $they'),
        genderise(' before $they'),
        genderise(' when $they'),
        genderise(' after $they'),
        genderise(' because $they'),
        genderise(' but then $they')
      ];
    }

    function or(a, b, chance=0.5) {
      return Math.random() > chance ? a : b;
    }

    function stringise(funcString) {
      return typeof funcString === 'function' ? funcString() : funcString;
    }
  };
}
