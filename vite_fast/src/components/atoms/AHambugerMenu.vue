<template>
  <div>
    <div class="hamburger_btn" @click="toggleMenu">
      <div class="block">
        <span class="line line_01" :class="{'btn_line01': ActiveBtn}"></span>
        <span class="line line_02" :class="{'btn_line02': ActiveBtn}"></span>
        <span class="line line_03" :class="{'btn_line03': ActiveBtn}"></span>
      </div>
    </div>
    <transition name="menu">
      <div class="menu" v-if="ActiveBtn">
        <ul>
          <li><a href="#">Make a New Project</a></li>
          <li><a href="#">Save</a></li>
          <li><a href="#">Import</a></li>
          <li><a href="#">Export</a></li>
          <li><a href="#">JA/EN</a></li>
          <li><a href="#">点線</a></li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'HamburgerMenu',
  setup() {
    const ActiveBtn = ref(false);
    const toggleMenu = () => {
      ActiveBtn.value = !ActiveBtn.value;
    };
    return {
      ActiveBtn,
      toggleMenu
    };
  }
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.hamburger_btn {
  width: 72px;
  height: 72px;
  cursor: pointer;
}

.hamburger_btn .line {
  position: absolute;
  top: 0;
  left: 20px;
  width: 32px;
  height: 2px;
  background: c.$black;
}

.hamburger_btn .line_01 {
  top: calc(50% - 10px);
  transition: 0.3s ease;
}

.hamburger_btn .line_02 {
  top: 50%;
  transition: 0.3s ease;
}

.hamburger_btn .line_03 {
  top: calc(50% + 10px);
  transition: 0.3s ease;
}

.btn_line01 {
  transform: translateY(10px) rotate(-45deg);
  transition: 0.3s ease;
}

.btn_line02 {
  opacity: 0;
  transition: 0.3s ease;
}

.btn_line03 {
  transform: translateY(-10px) rotate(45deg);
  transition: 0.3s ease;
}

/* サイドバー */
.menu-enter-active, .menu-leave-active {
  transition: opacity 0.3s;
}

.menu-enter, .menu-leave-to {
  opacity: 0;
}

.menu-leave, .menu-enter-to {
  opacity: 1;
}

.menu {
  background-color: c.$white;
  border: 5px solid c.$sub_6;
  z-index: 30;
  padding: 2rem 1rem;
  position: absolute;
  width: 15rem;
  height: calc(90vh - 15px);
  top: 10vh;
  opacity: 0.8;
}

.menu ul {
  margin: 1rem;
  padding: 0;
}

.menu li {
  list-style: none;
  line-height: 1;
  padding: 1rem;
}

.menu a {
  color: c.$gray;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 0 0rem;

  &:hover {
    background-color: c.$sub_8;
    color: c.$white;
  }
}

li {
  &:hover {
    background-color: c.$sub_8;
    a {
      color: c.$white;
    }
  }
}

</style>
