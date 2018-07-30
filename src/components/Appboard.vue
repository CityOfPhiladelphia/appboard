<template>
  <div id="ab-root"
       :class="rootClass"
  >
  <!-- :style="styleObject" -->
    <div id="address-container"
         :class="'cell small-24'"
    >
      <div class="address-header">
        <div class="medium-12 address-container">
          <h1 class="address-header-line-1">
            {{ address }}
          </h1>
          <div class="address-header-line-2"
               v-show="this.geocode"
          >
            PHILADELPHIA, PA {{ zipCode }}
          </div>
        </div>

        <address-input class="address-input-class">
          <address-candidate-list v-if="this.addressAutocompleteEnabled"
                                  class="address-candidates-class"
                                  slot="address-candidates-slot"
          />
        />

      </div>
    </div>

    <greeting v-show="shouldShowGreeting" />

    <div v-if="!shouldShowGreeting"
         class="components-container cell medium-cell-block-y"
    >
      <topic-component-group :topic-components="appConfig.components" />
    </div>

  </div>
</template>

<script>
  import philaVueComps from '@cityofphiladelphia/phila-vue-comps';
  const TopicComponentGroup = philaVueComps.TopicComponentGroup;
  const Greeting = philaVueComps.Greeting;
  const AddressInput = philaVueComps.AddressInput;
  const AddressCandidateList = philaVueComps.AddressCandidateList;

  export default {
    components: {
      TopicComponentGroup,
      Greeting,
      AddressInput,
      AddressCandidateList,
    },
    data() {
      const data = {
        // this will only affect the app size if the app is set to "plugin" mode
        styleObject: {
          'height': '100px'
        }
      };
      return data;
    },
    created() {
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    mounted() {
      this.$controller.appDidLoad();
    },
    computed: {
      appConfig() {
        return this.$config;
      },
      rootClass() {
        if (this.$config.plugin) {
          return 'grid-x';
        } else {
          return 'cell medium-auto grid-x';
        }
      },
      geocode() {
        return this.$store.state.geocode.data;
      },
      addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressAutocomplete.enabled === true) {
          return true;
        } else {
          return false;
        }
      },
      shouldShowGreeting() {
        return !(this.geocode || this.dorParcels);
      },
      isMobileOrTablet() {
        return this.$store.state.isMobileOrTablet;
      },
      geocodeData() {
        return this.$store.state.geocode.data
      },
      address() {
        const geocode = this.geocode;
        const dorParcels = this.$store.state.parcels.dor.data;
        const activeDorAddress = this.$store.state.parcels.dor.activeAddress;
        let address = "BEGIN REAL ESTATE TAX PAYMENT";

        if (geocode) {
          // TODO make this not ais-specific
          // REVIEW what's the difference between these two?
          const addressA = geocode.properties.street_address;
          const addressB = geocode.street_address;

          address = addressA || addressB;

        // a DOR address might be found even if there is no geocode
        } else if (activeDorAddress) {
          address = activeDorAddress;
        }

        return address;
      },
      zipCode() {
        const geocode = this.geocode;
        if (!geocode) return null;
        const zipCode = geocode.properties.zip_code;
        const zip4 = geocode.properties.zip_4;
        const parts = [zipCode];
        if (zip4) parts.push(zip4);
        return parts.join('-');
      },
    },
    methods: {
      closeAddressCandidateList() {
        this.$store.state.shouldShowAddressCandidateList = false;
      },
      handleWindowResize() {
        // this only actually affects the size if it is set to "plugin mode"
        if ($(window).width() >= 750) {
          this.styleObject.height = '600px'
        } else {
          this.styleObject.height = 'auto';
        }
      }
    },
  };
</script>

<style>
  /*don't highlight any form elements*/
  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  /* standards applies padding to buttons, which causes some weirdness with
  buttons on the map panel. override here. */
  button {
    padding: inherit;
  }

  .components-container {
    height: calc(100vh - 214px);
    width: 100%;
    padding: 40px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .address-header {
    background: #daedfe;
    color: #0f4d90;
    padding: 20px;

    /*this keeps the box shadow over the scrollable part of the panel*/
    position: relative;
    z-index: 1;

    -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    margin-bottom: 0px !important;
  }

  .address-header-line-1 {
    margin-bottom: 0;
    margin-top: 0;
    padding: 0px !important;
  }

  .address-header-line-2 {
    padding: 0px;
  }

  .address-container {
    display: inline-block;
  }

  .address-input-class {
    display: inline-block;
    position: absolute;
  }

  .address-candidates-class {
    display: inline-block;
  }

</style>
