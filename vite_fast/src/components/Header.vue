<template>
  <header>
    <div id="header">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/network">Network</RouterLink>
        <RouterLink to="/opm">OPM</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
#header {
  background-color: c.$white;
  width: 95%;
  height: 10vh;
  border-radius: 0.5rem;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
nav {
  text-align: center;

  a {
    &.router-link-exact-active {
      color: c.$green;

      &:hover {
        background-color: transparent;
      }
    }

    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid c.$black;

    &:first-of-type {
      border: 0;
    }
  }
}
</style>