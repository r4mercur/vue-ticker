<script setup>
const emit = defineEmits(["close", "confirm"]);
const props = defineProps({
  text: {
    type: String,
    default: "default text",
  },
  disableFooter: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <transition>
    <div class="modal__mask">
      <div class="modal__wrapper">
        <div class="modal__container bg-surface text-on-surface">
          <div class="modal__header">
            <slot name="header"> default header </slot>
            <div class="modal__header__close dark:invert" @click="emit('close')"></div>
          </div>

          <div class="modal__body">
            <slot name="body"> default body </slot>
          </div>

          <div v-if="!props.disableFooter" class="modal__footer">
            <slot name="footer">
              <div class="flex flex-col items-center m-6">
                <button id="save" @click="emit('confirm')" class="cursor-pointer w-full px-5 py-2.5 text-sm font-medium text-gray-900 rounded-lg bg-gradient-to-br from-teal-300 to-lime-300 hover:from-teal-400 hover:to-lime-400 transition-colors focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-lime-800">
                  {{ props.text }}
                </button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
/* Breakpoint */
$breakpoint-xs: 576px;
$breakpoint-sm: 768px;
$breakpoint-md: 992px;
$breakpoint-lg: 1200px;

.modal {
  &__mask {
    display: flex;
    align-items: flex-end;
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(#202225, .2);
    backdrop-filter: blur(2px);

    @media screen and (min-width: $breakpoint-sm) {
      align-items: center;
      justify-content: center;
    }
  }

  &__wrapper {
    width: 100%;
    display: flex;
  }

  &__container {
    position: relative;
    width: 100%;
    max-height: calc(100vh - 64px);
    overflow-y: scroll;
    padding: 24px;
    box-shadow: 0 12px 16px 0 rgba(#202225, .08), 0 4px 12px 0 rgba(#202225, .04);
    border-radius: 12px 12px 0 0;
    transition: background-color .2s ease-in-out, color .2s ease-in-out;

    @media screen and (min-width: $breakpoint-sm) {
      width: min(1000px, 92vw);
      max-height: calc(100vh - 128px);
      margin: 0 auto;
      border-radius: 12px;
      padding: 40px;
    }
  }

  &__header {
    position: relative;
    font-size: 32px;
    line-height: 36px;
    font-weight: 500;
    padding-top: 17px;

    @media screen and (min-width: $breakpoint-sm) {
      padding-top: 0;
    }

    &__close {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 40px;
      height: 40px;
      background: url('../../assets/ic_24_close.svg');
      background-position: center center;
      background-repeat: no-repeat;
      cursor: pointer;

      @media screen and (min-width: $breakpoint-sm) {
        top: -4px;
        right: -4px;
      }

      &:before {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(#202225, .08);
        transition: all .2s ease-in-out;

        @media screen and (min-width: $breakpoint-sm) {
          top: 4px;
          left: 4px;
          width: 32px;
          height: 32px;
        }
      }

      &:hover {
        &:before {
          background: rgba(#202225, .12);
        }
      }
    }

    &--withoutintro {
      margin-bottom: 32px;
    }
  }

  &__intro {
    margin-bottom: 32px;
  }

  &__body {
    margin: 20px 0 24px;

    p {
      b {
        font-weight: 500;
      }
    }
  }

  &__footer {
    position: sticky;
    z-index: 3;
    bottom: 0;
    width: calc(100% + 48px);
    margin: -24px -24px 0;
    padding: 24px 24px 0;

    @media screen and (min-width: $breakpoint-sm) {
      width: calc(100% + 80px);
      margin: -40px -40px 0;
      padding: 40px 40px 0;
    }

    &:before {
      content: '';
      position: absolute;
      z-index: -1;
      bottom: -24px;
      left: 0;
      width: 100%;
      height: calc(100% + 24px);
      background-image: linear-gradient(180deg, rgb(var(--surface) / 0) 0%, rgb(var(--surface)) 50%, rgb(var(--surface)) 100%);

      @media screen and (min-width: $breakpoint-sm) {
        bottom: -40px;
        height: calc(100% + 40px);
        border-radius: 0 0 12px 12px;
      }
    }

    .button {
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }
}


/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-active,
.modal-leave-active {
  transition: all 1s;

  .modal__container {
    transition: all 1s;
  }
}

.modal-enter {
  opacity: 0 !important;
}

.modal-leave-to {
  opacity: 0 !important;
}

.modal-enter .modal__container,
.modal-leave-to .modal__container {
  transform: translateY(100%);
}
</style>