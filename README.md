# appboard

Appboard is a framework for building data-rich applications for the City of Philadelphia.  It can be used as a template for creating any application which presents information about an address and for which a map is not required.

The data returned is presented in the body of the application using components of the library [phila-vue-comps](https://github.com/CityOfPhiladelphia/phila-vue-comps), such as [Vertical Tables](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/Vertical-Table) or [Horizontal Tables](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/Horizontal-Table), etc.  These components may be placed right in the body of the page, or within different "topics" which can be opened and closed.  A [TopicSet](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/TopicSet) can exist next to other permanent components.

Appboard uses all of the functions of the library [phila-vue-datafetch](https://github.com/CityOfPhiladelphia/phila-vue-datafetch), allowing it to return data based on any address.

![Atlas](https://s3.amazonaws.com/mapboard-images/Appboard.JPG)

## Usage
Check out [the wiki](https://github.com/CityOfPhiladelphia/appboard/wiki) for usage documentation.

## Publishing

To publish a new version of Appboard to NPM:

1. Commit your changes to `master`.
2. Bump the NPM version with `npm version major|minor|patch`.
3. Push with tags: `git push && git push --tags`.
4. Update wiki docs to reflect new version and/or dependency changes.

Travis will now run a build and publish to NPM.
