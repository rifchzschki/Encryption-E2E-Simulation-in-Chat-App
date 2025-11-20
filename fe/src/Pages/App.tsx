import Navbar from "../components/Navbar";

function App() {
  return (
    <>
      <main className="flex bg-amber-200 h-screen">
        <section className="bg-amber-700 w-1/3">
          <Navbar />
          <section>Search Contact</section>
          <section>Contact List</section>
        </section>
        <section className="bg-amber-500 w-2/3">
          <section>Profile Receiver Information</section>
          <section>Interface chat</section>
        </section>
      </main>
      <footer></footer>
    </>
  );
}

export default App;
