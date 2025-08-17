import './styles.css';

const Loader = () => {
	return (
		<div className='loader-overlay'>
			<div className='loading'>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>
		</div>
	);
};

export default Loader;
