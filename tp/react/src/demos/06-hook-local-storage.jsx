import Preferences from '@tp/06-hook-local-storage/Preferences.jsx';

export default function Demo() {
  return (
    <>
      <Preferences />
      <p className="astuce">Modifie les champs puis recharge la page : ils doivent rester remplis.</p>
    </>
  );
}
