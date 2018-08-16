<template>
  <div id="ab-root"
       :class="rootClass"
  >
    <div class="cell small-24 medium-24 address-header">
      <div class="columns small-24 medium-12 large-12 address-container"
           :style="this.addressContainerStyle"
      >
        <h1 class="address-header-line-1">
          {{ address }}
        </h1>
        <div class="address-header-line-2"
             v-show="this.geocode"
        >
          PHILADELPHIA, PA {{ zipCode }}
        </div>
      </div>

      <div class="columns small-24 medium-12 large-12 input-container"
           :style="this.inputContainerStyle"
      >
        <address-input :widthFromConfig="this.addressInputWidth"
                       :placeholder="this.addressInputPlaceholder"
        >
          <address-candidate-list v-if="this.addressAutocompleteEnabled"
                                  slot="address-candidates-slot"
                                  :widthFromConfig="this.addressInputWidth"
          />
        />
      </div>

    </div>

    <greeting v-show="shouldShowGreeting" />

    <div v-if="!shouldShowGreeting"
         class="components-container cell medium-cell-block-y"
         :style="this.componentsContainerStyle"
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
        componentsContainerStyle: {
          'overflow-y': 'auto',
          'height': '100px',
        },
        addressContainerStyle: {
          'height': '100%',
          'padding-bottom:': '20px',
        },
        inputContainerStyle: {
          'align-items': 'flex-start',
          'height': '100%',
          'padding-top': '20px',
        }
      };
      return data;
    },
    // created() {
    // },
    mounted() {
      console.log('appboard mounted is running');
      this.$controller.appDidLoad();
      window.addEventListener('click', this.closeAddressCandidateList);
      window.addEventListener('resize', this.handleWindowResize);
      this.handleWindowResize();
    },
    computed: {
      inputAlign() {
        if (this.appConfig.addressInput.position) {
          const position = this.appConfig.addressInput.position;
          switch(position) {
            case 'left':
              return 'flex-start';
            case 'right':
              return 'flex-end';
            case 'center':
              return 'center';
          }
        } else {
          return 'flex-start';
        }
      },
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
      addressInputWidth() {
        return this.appConfig.addressInput.width;
      },
      addressInputPlaceholder() {
        return this.appConfig.addressInput.placeholder;
      },
      addressAutocompleteEnabled() {
        // TODO tidy up the code
        if (this.$config.addressInput.autocompleteEnabled === true) {
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
        let address;
        if (this.$config.defaultAddressTextPlaceholder) {
          address = this.$config.defaultAddressTextPlaceholder;
        }

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
          // this.componentsContainerStyle.height = '600px';
          this.addressContainerStyle = {
            'height': '100%',
            'align-items': 'flex-start',
            'padding-bottom': '20px',
          }
          this.inputContainerStyle = {
            'height': '100%',
            'align-items': this.inputAlign,
            'padding-top': '20px',
          }
          const rootElement = document.getElementById('ab-root');
          const rootStyle = window.getComputedStyle(rootElement);
          const rootHeight = rootStyle.getPropertyValue('height');
          const rootHeightNum = parseInt(rootHeight.replace('px', ''));
          const topicsHeight = rootHeightNum - 83;
          // console.log('rootElement:', rootElement, 'rootHeight:', rootHeight, 'rootHeightNum:', rootHeightNum, 'topicsHeight:', topicsHeight);
          this.componentsContainerStyle.height = topicsHeight.toString() + 'px';
          this.componentsContainerStyle['overflow-y'] = 'auto';


        } else {
          this.addressContainerStyle = {
            'height': 'auto',
            'align-items': 'center',
            'padding-bottom': '5px',
          }
          this.inputContainerStyle = {
            'height': 'auto',
            'align-items': 'center',
            'padding-top': '5px',
          }

          this.componentsContainerStyle.height = 'auto';
          // const rootElement = document.getElementById('ab-root');
          // const rootStyle = window.getComputedStyle(rootElement);
          // const rootHeight = rootStyle.getPropertyValue('height');
          // const rootHeightNum = parseInt(rootHeight.replace('px', ''));
          // const topicsHeight = rootHeightNum - 83;
          // // console.log('rootElement:', rootElement, 'rootHeight:', rootHeight, 'rootHeightNum:', rootHeightNum, 'topicsHeight:', topicsHeight);
          // this.componentsContainerStyle.height = topicsHeight.toString() + 'px';

          this.componentsContainerStyle['overflow-y'] = 'hidden';
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
    /* height: calc(100vh - 214px); */
    width: 100%;
    padding: 40px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .address-header {
    background: #daedfe;
    color: #0f4d90;
    /*this keeps the box shadow over the scrollable part of the panel*/
    position: relative;
    z-index: 1;
    -webkit-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    -moz-box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    box-shadow: 0px 5px 7px -2px rgba(0,0,0,0.18);
    margin-bottom: 0px !important;
    display: inline-block;
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
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .input-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 20px;
    padding-bottom: 20px;
  }

</style>
