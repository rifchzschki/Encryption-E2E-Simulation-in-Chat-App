import Navbar from '../components/Navbar';
import ChatComponent from '../components/ChatComponent';
import {useAuth} from '../context/AuthContext';
function App() {
  const {token, username} = useAuth();
  return (
    <>
      <main className="flex bg-amber-200 h-screen">
        <section className="bg-amber-700 w-1/3">
          <Navbar />
          <section>Search Contact</section>
          <p>{token}</p>
          <p>{username}</p>
          <section>Contact List</section>
        </section>
        <section className="bg-amber-500 w-2/3">
          {/* <section>Profile Receiver Information</section> */}
          <section>
            <ChatComponent />
          </section>
        </section>
      </main>
      <footer></footer>
    </>
  );
}

export default App;
